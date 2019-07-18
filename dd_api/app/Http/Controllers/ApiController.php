<?php


namespace App\Http\Controllers;



use Illuminate\Http\Response;

use Illuminate\Pagination\LengthAwarePaginator as Paginator;

use Laravel\Lumen\Routing\Controller as BaseController;

use \Illuminate\Http\Response as Res;



/**

 * Class ApiController

 * @package App\Modules\Api\Lesson\Controllers

 */

class ApiController extends BaseController

{

    /**

     * @var int

     */

    protected $statusCode = Res::HTTP_OK;



    /**

     * @return mixed

     */

    public function getStatusCode()

    {

        return $this->statusCode;

    }

    public function __construct()
    {
        date_default_timezone_set("Asia/Calcutta");
    }

    /**

     * @param $message

     * @return json response

     */

    public function setStatusCode($statusCode)

    {

        $this->statusCode = $statusCode;

        return $this;

    }



    public function respondCreated($message, $data=null){

        return $this->respond([

            'status' => 'success',

            'status_code' => Res::HTTP_CREATED,

            'message' => $message,

            'data' => $data

        ]);

    }



    /**

     * @param Paginator $paginate

     * @param $data

     * @return mixed

     */

    protected function respondWithPagination(Paginator $paginate, $data, $message){

        $data = array_merge($data, [

            'paginator' => [

                'total_count'  => $paginate->total(),

                'total_pages' => ceil($paginate->total() / $paginate->perPage()),

                'current_page' => $paginate->currentPage(),

                'limit' => $paginate->perPage(),

            ]

        ]);

        return $this->respond([

            'status' => 'success',

            'status_code' => Res::HTTP_OK,

            'message' => $message,

            'data' => $data

        ]);

    }



    public function respondNotFound($message = 'Not Found!'){

        return $this->respond([

            'status' => 'error',

            'status_code' => Res::HTTP_NOT_FOUND,

            'message' => $message,

        ]);

    }



    public function respondInternalError($message){

        return $this->respond([

            'status' => 'error',

            'status_code' => Res::HTTP_INTERNAL_SERVER_ERROR,

            'message' => $message,

        ]);

    }



    public function respondValidationError($message, $errors){

        return $this->respond([

            'status' => 'error',

            'status_code' => Res::HTTP_UNPROCESSABLE_ENTITY,

            'message' => $message,

            'data' => $errors

        ]);

    }



    public function respond($data, $headers = []){

        return response()->json($data, $this->getStatusCode(), $headers);

    }



    public function respondWithError($message){

        return $this->respond([

            'status' => 'error',

            'status_code' => Res::HTTP_UNAUTHORIZED,

            'message' => $message,

        ]);

    }

}